'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import type { UseChatHelpers } from '@ai-sdk/react';
import { DoctorCard } from './doctor-card';
import { AppointmentConfirmation } from './appointment-confirmation';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn('flex flex-col gap-4 w-full', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                            message.role === 'user',
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'call') {
                  const { args } = toolInvocation;

                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                }

                if (state === 'result') {
                  const { result } = toolInvocation;

                  if (toolName === 'listDoctors') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Available Doctors:
                        </div>
                        <ul className="list-disc ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((doc: any) => (
                              <li key={doc.id} className="mb-3">
                                <div className="font-medium">
                                  {doc.name}{' '}
                                  <span className="text-muted-foreground">
                                    ({doc.specialty})
                                  </span>
                                </div>
                                <div className="text-sm text-zinc-500">
                                  Hospital: {doc.hospital}
                                </div>
                                <div className="text-sm text-zinc-500">
                                  Experience: {doc.experience} years
                                </div>
                                <div className="text-sm text-zinc-500">
                                  Availability: {doc.availability}
                                </div>
                                <div className="text-sm text-zinc-500">
                                  Fees: ${doc.fees}
                                </div>
                                {doc.bio && (
                                  <div className="text-xs text-zinc-400 mt-1">
                                    {doc.bio}
                                  </div>
                                )}
                              </li>
                            ))
                          ) : (
                            <li>No doctors found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'bookAppointment') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">Appointment Booked!</div>
                        <div className="text-muted-foreground text-sm">
                          Your appointment has been scheduled.
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'listAppointments') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Your Upcoming Appointments:
                        </div>
                        <ul className="list-decimal ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((appt: any) => (
                              <li key={appt.id}>
                                <span className="font-medium">
                                  {appt.doctor?.name}
                                </span>{' '}
                                <span className="text-muted-foreground">
                                  ({appt.doctor?.specialty})
                                </span>{' '}
                                <span className="text-xs text-zinc-400">
                                  {appt.time
                                    ? new Date(appt.time).toLocaleString()
                                    : ''}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li>No appointments found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'cancelAppointment') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">
                          Appointment Cancelled!
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Your appointment has been cancelled successfully.
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'rescheduleAppointment') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">
                          Appointment Rescheduled!
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Your appointment has been rescheduled to{' '}
                          <span className="font-medium">
                            {result.time
                              ? new Date(result.time).toLocaleString()
                              : ''}
                          </span>
                          .
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'doctorDetails') {
                    return <DoctorCard key={toolCallId} {...result} />;
                  }

                  if (toolName === 'bookAppointment') {
                    return (
                      <AppointmentConfirmation
                        key={toolCallId}
                        time={result.time}
                        doctor={result.doctor}
                      />
                    );
                  }

                  if (toolName === 'bookAmbulance') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">Ambulance Booked!</div>
                        <div className="text-muted-foreground text-sm">
                          Your ambulance has been scheduled for pickup at{' '}
                          <span className="font-medium">
                            {result.pickupLocation}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {result.destination}
                          </span>{' '}
                          on{' '}
                          <span className="font-medium">
                            {result.time
                              ? new Date(result.time).toLocaleString()
                              : ''}
                          </span>
                          .
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'listAmbulanceBookings') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Your Ambulance Bookings:
                        </div>
                        <ul className="list-decimal ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((booking: any) => (
                              <li key={booking.id}>
                                <span className="font-medium">
                                  {booking.pickupLocation}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                  {booking.destination}
                                </span>{' '}
                                on{' '}
                                <span className="text-xs text-zinc-400">
                                  {booking.time
                                    ? new Date(booking.time).toLocaleString()
                                    : ''}
                                </span>{' '}
                                <span className="text-muted-foreground">
                                  ({booking.status})
                                </span>
                              </li>
                            ))
                          ) : (
                            <li>No ambulance bookings found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'listLabs') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Available Labs:
                        </div>
                        <ul className="list-disc ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((lab: any) => (
                              <li key={lab.id} className="mb-3">
                                <div className="font-medium">{lab.name}</div>
                                <div className="text-sm text-zinc-500">
                                  Address: {lab.address}
                                </div>
                                <div className="text-sm text-zinc-500">
                                  Time Slots:{' '}
                                  {Array.isArray(lab.timeSlots)
                                    ? lab.timeSlots.join(', ')
                                    : JSON.stringify(lab.timeSlots)}
                                </div>
                                <div className="text-sm mt-1">Tests:</div>
                                <ul className="ml-4">
                                  {Array.isArray(lab.tests) &&
                                  lab.tests.length > 0 ? (
                                    lab.tests.map((test: any) => (
                                      <li
                                        key={test.id}
                                        className="text-xs text-zinc-600"
                                      >
                                        {test.name} ({test.type}) - $
                                        {test.price}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-xs text-zinc-400">
                                      No tests available.
                                    </li>
                                  )}
                                </ul>
                              </li>
                            ))
                          ) : (
                            <li>No labs found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'bookLabTest') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">Lab Test Booked!</div>
                        <div className="text-muted-foreground text-sm">
                          Your {result.test?.name} ({result.test?.type}) test
                          has been scheduled at{' '}
                          <span className="font-medium">
                            {result.lab?.name}
                          </span>{' '}
                          ({result.lab?.address}) for{' '}
                          <span className="font-medium">
                            {result.time
                              ? new Date(result.time).toLocaleString()
                              : ''}
                          </span>{' '}
                          ({result.locationType}).
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'listLabBookings') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Your Lab Test Bookings:
                        </div>
                        <ul className="list-decimal ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((booking: any) => (
                              <li key={booking.id}>
                                <span className="font-medium">
                                  {booking.test?.name}
                                </span>{' '}
                                ({booking.test?.type}) at{' '}
                                <span className="font-medium">
                                  {booking.lab?.name}
                                </span>{' '}
                                on{' '}
                                <span className="text-xs text-zinc-400">
                                  {booking.time
                                    ? new Date(booking.time).toLocaleString()
                                    : ''}
                                </span>{' '}
                                ({booking.locationType}){' '}
                                <span className="text-muted-foreground">
                                  ({booking.status})
                                </span>
                              </li>
                            ))
                          ) : (
                            <li>No lab bookings found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'cancelLabBooking') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">
                          Lab Booking Cancelled!
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Your lab test booking has been cancelled successfully.
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'addMedication') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">Medication Added!</div>
                        <div className="text-muted-foreground text-sm">
                          Your medication{' '}
                          <span className="font-medium">{result.name}</span> (
                          {result.dosage}) has been added with reminders.
                        </div>
                      </div>
                    );
                  }

                  if (toolName === 'listMedications') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Your Medications:
                        </div>
                        <ul className="list-disc ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((med: any) => (
                              <li key={med.id}>
                                <span className="font-medium">{med.name}</span>{' '}
                                ({med.dosage})
                                {med.notes && (
                                  <span className="text-xs text-zinc-400">
                                    {' '}
                                    — {med.notes}
                                  </span>
                                )}
                                <span className="text-xs text-zinc-400">
                                  {' '}
                                  (from{' '}
                                  {med.startDate
                                    ? new Date(
                                        med.startDate,
                                      ).toLocaleDateString()
                                    : ''}
                                  {med.endDate
                                    ? ` to ${new Date(med.endDate).toLocaleDateString()}`
                                    : ''}
                                  )
                                </span>
                              </li>
                            ))
                          ) : (
                            <li>No medications found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'listMedicationReminders') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold mb-1">
                          Your Medication Reminders:
                        </div>
                        <ul className="list-decimal ml-6">
                          {Array.isArray(result) && result.length > 0 ? (
                            result.map((rem: any) => (
                              <li key={rem.id}>
                                <span className="font-medium">
                                  {rem.timeOfDay}
                                </span>{' '}
                                on{' '}
                                <span className="text-xs text-zinc-400">
                                  {rem.date
                                    ? new Date(rem.date).toLocaleDateString()
                                    : ''}
                                </span>{' '}
                                —{' '}
                                <span className="text-muted-foreground">
                                  {rem.status}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li>No medication reminders found.</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (toolName === 'markMedicationReminder') {
                    return (
                      <div key={toolCallId} className="my-2">
                        <div className="font-semibold">
                          Medication Reminder Updated!
                        </div>
                        <div className="text-muted-foreground text-sm">
                          This reminder has been marked as{' '}
                          <span className="font-medium">{result.status}</span>.
                        </div>
                      </div>
                    );
                  }

                  if (
                    [
                      'listDoctors',
                      'bookAppointment',
                      'listAppointments',
                      'getWeather',
                      'createDocument',
                      'updateDocument',
                      'requestSuggestions',
                    ].includes(toolName)
                  ) {
                    return null;
                  }

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview
                          isReadonly={isReadonly}
                          result={result}
                        />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolResult
                          type="update"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolResult
                          type="request-suggestions"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
